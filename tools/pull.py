import click
from base import cache_urls, pull

refund_link = "https://www.ozon.ru/my/returnDetails?returnNumber="
order_link_base_url = "https://www.ozon.ru/my/orderdetails/?order="


@pull.command()
@click.argument("refunds", nargs=-1)
@click.pass_context
def refunds(ctx, refunds):
    session = ctx.obj["session"]
    delay = ctx.obj["delay"]
    retries = ctx.obj["retries"]

    cache_urls(session, refund_link, refunds, "refunds", delay, retries)


@pull.command()
@click.argument("orders", nargs=-1)
@click.pass_context
def orders(ctx, orders):
    delay = ctx.obj["delay"]
    session = ctx.obj["session"]
    base_url = order_link_base_url
    retries = ctx.obj["retries"]
    items = orders
    cache_urls(session, order_link_base_url, orders, "orders", delay, retries)
