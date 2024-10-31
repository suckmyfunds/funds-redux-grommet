import click
from base import cli
import os
import bs4
import orders
import refunds
import pathlib as p


@cli.command()
@click.option("-d", "--debug", is_flag=True)
@click.argument("orders_dir")
@click.argument("refunds_dir")
@click.pass_obj
def parse(obj, debug, orders_dir, refunds_dir):
    obj["debug"] = debug
    if debug:
        printer = click.echo
    else:
        printer = lambda x: None

    obj["printer"] = printer

    orders_files = [p.Path(orders_dir) / x for x in os.listdir(orders_dir)]
    refunds_files = [p.Path(refunds_dir) / x for x in os.listdir(refunds_dir)]

    orders = parse_orders(obj, orders_files)
    refunds = parse_refunds(obj, refunds_files)
    print(orders.keys())
    print(refunds.keys())


def parse_orders(obj, files: list[p.Path]):
    printer = obj["printer"]
    debug = obj["debug"]

    products = {}
    for filename in files:
        item_id = filename.name
        printer(f"process {item_id}")
        if not filename.is_file():
            printer(f"not found file {filename}")
            continue

        with filename.open() as f:
            content = f.read()
        soup = bs4.BeautifulSoup(content, features="lxml")

        try:
            r = orders.parse(soup, printer)
            products.update(r)
        except Exception as e:
            click.echo(f"can't parse {item_id}: {e}")
            if debug:
                raise e
            return {}

    return products


def parse_refunds(obj, files: list[p.Path]):
    printer = obj["printer"]
    debug = obj["debug"]
    products = dict()
    for filename in files:
        item_id = filename.name
        printer(f"process {item_id}")
        if not filename.is_file():
            printer(f"not found file {filename}")
            continue

        with filename.open() as f:
            content = f.read()
        soup = bs4.BeautifulSoup(content, features="lxml")

        try:
            refunded_products = refunds.parse(soup, item_id, printer)
            products.update(refunded_products)
        except Exception as e:
            click.echo(f"can't parse {item_id}: {e}")
            if debug:
                raise e
    return products
