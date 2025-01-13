import click
from base import cli
import os
import bs4
import orders
import refunds
import json
from tqdm import tqdm
import pathlib as p
import pandas as pd


@cli.command()
@click.option("-d", "--debug", is_flag=True)
@click.argument("orders_dir")
@click.argument("refunds_dir")
@click.option(
    "--orderscache/--no-orderscache",
    default=True,
    show_default=True,
    help="use orders cache",
)
@click.option(
    "--refundscache/--no-refundscache",
    default=True,
    show_default=True,
    help="use refunds cache",
)
@click.pass_obj
def parse(obj, debug, orders_dir, refunds_dir, orderscache, refundscache):
    obj["debug"] = debug
    if debug:
        printer = click.echo
    else:
        printer = lambda x: None

    obj["printer"] = printer
    cache_dir = p.Path("cache")
    cache_dir.mkdir(exist_ok=True)
    obj["cache_dir"] = cache_dir

    orders_files = [
        p.Path(orders_dir) / x for x in os.listdir(orders_dir) if "cache" not in x
    ]
    refunds_files = [
        p.Path(refunds_dir) / x for x in os.listdir(refunds_dir) if "cache" not in x
    ]

    orders = parse_orders(obj, orders_files, orderscache)
    refunds = parse_refunds(obj, refunds_files, refundscache)
    with open("orders_out.json", "w") as f:
        json.dump(orders, f)
    with open("refunds_out.json", "w") as f:
        json.dump(refunds, f)

    # reshape
    refunds_orders = {}
    for product_id, data in refunds.items():
        data["product_name"]  = product_id
        refunds_orders[data["order_id"]] = data

    result_products = []
    for product in orders.values():
        try:
            # print(product["order_id"], refunds_orders.keys())
            refund = refunds_orders.get(product["order_id"])
            if refund and refund["amount"] == product["amount"]:
                print(f"filter out {product['text']} because of {refund['refund_id']}")
                continue
            result_products.append(product)
        except KeyError as e:
            click.echo(f"error on analysis the {product} and {refund}: {repr(e)}")

    output_file = "orders.filtered.json"

    fr = pd.DataFrame(result_products)
    fr.to_csv("result.csv")
    with open(output_file, "w") as f:
        json.dump(result_products, f)


@cli.command()
@click.option("-d", "--debug", is_flag=True)
@click.argument("order_filename")
@click.option(
    "--cache/--no-cache",
    default=True,
    show_default=True,
    help="use orders cache",
)
@click.pass_obj
def parse_order(obj, debug, order_filename, cache):
    printer = obj["printer"]
    debug = obj["debug"]
    cache_dir = p.Path("cache") / "orders"
    cache_dir.mkdir(exist_ok=True)
    parseF = lambda soup, item_id: orders.parse(soup, printer, item_id)
    if not p.Path(order_filename).exists():
        click.echo(f"not find {order_filename}", err=True)
        return 1
    result = parse_file(parseF, debug, printer, cache, cache_dir, p.Path(order_filename))
    click.echo(json.dumps(result, ensure_ascii=False, indent=2))


def parse_file(parseF, is_debug, printer, use_cache, cache_dir, filename):
    item_id = filename.name
    cache_filename = cache_dir / item_id

    printer(f"process {item_id}")
    if not filename.is_file():
        printer(f"not found file {filename}")
        return None
    if use_cache and p.Path(cache_filename).is_file():
        printer(f"load_cache {cache_filename}")
        with p.Path(cache_filename).open() as f:
            result = json.load(f)
    else:
        with filename.open() as f:
            content = f.read()
        soup = bs4.BeautifulSoup(content, features="lxml")

        try:
            result = parseF(soup, item_id)
            with open(cache_filename, "w") as f:
                json.dump(result, f)
        except TypeError as e:
            click.echo(f"issue with dumping of the {result}: {repr(e)}")
        except Exception as e:
            click.echo(f"can't parse {item_id}: {repr(e)}")
            if is_debug:
                raise e
            return {}
    return result


def parse_orders(obj, files: list[p.Path], use_cache=True):
    printer = obj["printer"]
    debug = obj["debug"]
    cache_dir = obj["cache_dir"] / "orders"
    cache_dir.mkdir(exist_ok=True)
    results = {}
    for filename in tqdm(files, desc="orders"):
        parseF = lambda soup, item_id: orders.parse(soup, printer, item_id)
        r = parse_file(parseF, debug, printer, use_cache, cache_dir, filename)
        results.update(r)
    return results


def parse_refunds(obj, files: list[p.Path], use_cache=True):
    printer = obj["printer"]
    debug = obj["debug"]
    cache_dir = obj["cache_dir"] / "refunds"
    cache_dir.mkdir(exist_ok=True)
    results = dict()
    for filename in tqdm(files, desc="refunds"):
        parseF = lambda soup, item_id: refunds.parse(soup, printer, item_id)
        refunded_products = parse_file(parseF, debug, printer, use_cache, cache_dir, filename)
        results.update(refunded_products)
    return results

