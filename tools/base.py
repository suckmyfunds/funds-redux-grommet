import click
import time
import os
import sys
from dataclasses import dataclass
import requests as r
from bs4 import BeautifulSoup
from tqdm import tqdm
import brotli


def cache_urls(session, base_url, items, dest_dir, delay, retries):
    for item_id in tqdm(items, dest_dir):
        curtime = time.time()
        status_code = 0
        while status_code != 200 and retries > 0:
            res = session.get(base_url + item_id)
            status_code = res.status_code
            if status_code != 200:
                click.echo(f"ERROR PROCESS {res.status_code}")
                click.echo("retries: {retries}")
                retries -= 1
                if status_code == 403:
                    click.echo("403: check cookies")
                click.echo(res.text)
        else:
            with open(dest_dir + "/" + item_id, "w") as f:
                # f.write(res.content)
                try:
                    f.write(res.content.decode("utf-8"))
                except UnicodeDecodeError:
                    f.write(brotli.decompress(res.content).decode("utf-8"))

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
@click.option("-r", "--retries", type=int, default=3, help="retries on errors")
@click.pass_obj
def pull(obj, delay, cookies_file, retries):
    obj["delay"] = delay
    s = r.session()

    headers = prepare_headers(cookies_file)
    for k, v in headers.items():
        s.headers[k] = v
    obj["session"] = s
    obj["retries"] = retries


def select_alt(soup, selectors: str):
    if "|" in selectors:
        selectors = selectors.split("|")
    else:
        selectors = [selectors]

    for sel in selectors:
        out = soup.select_one(sel)
        if out:
            return out
    raise Exception(f"not found by selectors {selectors}")


def price_parse(price: str) -> float:
    return float(price.replace("\xa0", "").replace(",", ".").split()[0])
