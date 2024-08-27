import click
from base import cache_urls, pull, parse

refund_link = "https://www.ozon.ru/my/returnDetails?returnNumber="


@pull.command()
@click.argument("refunds", nargs=-1)
@click.pass_context
def refunds(ctx, refunds):
    session = ctx.obj["session"]
    delay = ctx.obj["delay"]
    cache_urls(session, refund_link, refunds, "refunds", delay)
