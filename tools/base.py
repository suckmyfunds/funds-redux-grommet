import click
import time
import os
import sys
from dataclasses import dataclass
import requests as r
from bs4 import BeautifulSoup
from tqdm import tqdm
import brotli


@dataclass
class Selectors:
    ship: str
    ship_state: str
    product: str
    product_name: str
    product_link: str
    price: str
    count: str
    order_date: str
    order_name: str
    order_price: str


select = Selectors(
    ship="html body div#__ozon div#layoutPage.a0.a1.a4 div.b6 div.d8v_9 div div.container.c div.e1 div.c8 div div.e4 div.pf_14.tsBody500Medium",
    ship_state="div.fp0_14 div div.f1p_14 div.e8r_14 span.r8e_14",
    product="div.pf0_14 div.fn8_14",
    price="div.f9n_14 ul.f8o_14 li.fo3_14 div.f4o_14 div.d7012-a span.d7012-a3.d7012-a5 span.d7012-a2",
    count="div.f9n_14 ul.f8o_14 li.fo3_14 div.f4o_14 div.o4f_14",
    product_name="div.f9n_14 ul.f8o_14 li.fo3_14 div.of3_14 a.o3f_14",
    product_link="div.f9n_14 ul.f8o_14 li.fo3_14 div.of3_14 a.o3f_14",
    order_name="html body div#__ozon div#layoutPage.a0.a1.a4 div.b6 div.d8v_9 div div.container.c div.e1 div.c8 div div.f6n_14 div.fn6_14 h2.tsHeadline700XLarge",
    order_date="html body div#__ozon div#layoutPage.a0.a1.a4 div.b6 div.d8v_9 div div.container.c div.e1 div.c8 div div.f6n_14 p.tsBody400Small",
    order_price="html body div#__ozon div#layoutPage.a0.a1.a4 div.b6 div.d8v_9 div div.container.c div.e1 div.c8 div section.f4n_14 div.fn5_14 div.w0f_14 div.f1w_14 div.tsBodyControl500Medium.fw2_14 div.wf2_14",
)


def cache_urls(session, base_url, items, dest_dir, delay):
    for item_id in tqdm(items):
        curtime = time.time()
        res = session.get(base_url + item_id)
        if res.status_code != 200:
            if res.status_code == 403:
                click.echo("403: check cookies")
                sys.exit(1)
            click.echo(f"ERROR PROCESS {res.status_code}")
            click.echo(res.text)
        else:
            with open(dest_dir + "/" + item_id, "w") as f:
                #f.write(res.content)
                try:
                    f.write(res.content.decode("utf-8"))
                except UnicodeDecodeError:
                    f.write(brotli.decompress(res.content).decode('utf-8'))

        elapsed = time.time() - curtime
        if elapsed < delay and delay - elapsed > 50:
            sleep_time = delay - elapsed
            click.echo(f"sleep for {sleep_time}")
            time.sleep(sleep_time / 100)


def prepare_headers(cookies_file):
    headers = {}
    with open(cookies_file, encoding="utf-8") as f:
        raw_headers = f.read()
    for l in raw_headers.splitlines():
        name, *vals = l.split(":")
        headers[name.strip()] = ":".join(vals).strip()
    return headers


@click.group()
@click.option("-d", "--debug", help="debug mode", is_flag=True)
@click.pass_context
def cli(ctx, debug):
    ctx.ensure_object(dict)
    if debug:
        ctx.obj["printer"] = click.echo
    else:
        ctx.obj["printer"] = lambda x: None
    ctx.obj["debug"] = debug

    os.makedirs("orders", exist_ok=True)
    os.makedirs("refunds", exist_ok=True)


@cli.group()
@click.option("-d", "--delay", type=int, default=30)
@click.option("-c", "--cookies_file", type=str, default="cookies")
@click.pass_obj
def pull(obj, delay, cookies_file):
    obj["delay"] = delay
    s = r.session()

    headers = prepare_headers(cookies_file)
    for k, v in headers.items():
        s.headers[k] = v
    obj["session"] = s


