import click
from base import cache_urls, pull, parse
from dataclasses import dataclass


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
    refund_order_id: str
    refund_product_link: str
    refund_state: str


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
    refund_order_id="html.utvaowbs body div#__ozon div#layoutPage.a0.a1 div.b6 div.d8v_9 div div.container.c div.e1 div.c8 div.u9x_30 div.xu9_30 div.vx3_30 div.v3x_30 div.xv4_30 div.yt5_30 div.ty6_30 button.ga113-a.undefined div.ga113-a2.tsBodyControl400Small",
    refund_product_link="html.utvaowbs body div#__ozon div#layoutPage.a0.a1 div.b6 div.d8v_9 div div.container.c div.e1 div.c8 div.u9x_30 div.xu9_30 div.vx3_30 div.v3x_30 div.xv4_30 div.yt5_30 div.ty7_30 div.yt6_30 div.y2t_30 div.ty3_30 div.yt3_30 div.ty4_30 a.w2u_30.uw3_30.u3w_30",
    refund_state="html.utvaowbs body div#__ozon div#layoutPage.a0.a1 div.b6 div.d8v_9 div div.container.c div.e1 div.c8 div.u9x_30 div.xu9_30 div.vx3_30 div.v3x_30 div.xv4_30 div.z4t_30.x3v_30 div.tz5_30 div.b211-a0 div.b211-b div.b211-b0.tsBodyControl400Small",
)


@pull.command()
@click.argument("orders", nargs=-1)
@click.pass_context
def orders(ctx, orders):
    delay = ctx.obj["delay"]
    session = ctx.obj["session"]
    base_url = order_link_base_url
    items = orders
    cache_urls(session, order_link_base_url, orders, "orders", delay)


@parse.command()
@click.pass_context
def orders(ctx):
    orders = ctx.obj["soups"].items()
    result = {}
    try:
        for order_id, soup in orders:
            r = parse_products(soup, debug)
            products = r.items()
            for link, data in products:
                text = data["text"]
                total_price = data["total_price"]
                price = data["price"]
                if total_price != price:
                    raise Exception(
                        "price not match. check count,price and total_price selectors"
                    )
            for link, data in products:
                click.echo(f"{order_id};" + ";".join([str(v) for v in data.values()]))

    except Exception as e:
        click.echo(f"can't parse {order_name}: {e}")
        if debug:
            raise e
        return {}


def parse_products(soup, debug=False):
    results = {}
    order_name = soup.select_one(select.order_name).text.strip()
    order_date = soup.select_one(select.order_date).text.strip()
    ships = soup.select(select.ship)
    printer(f"got ships {len(ships)}")
    try:
        for ship in ships:
            # local delivery
            if ship.select_one(select.ship_state):
                state = ship.select_one(select.ship_state).text.strip()
            # foreign delivery
            else:
                state = "Foregn"

            products = ship.select(select.product)
            printer(f"ship {state=} in {order_name=} have {len(products)} products")
            if len(products) == 0:
                printer("order {order_name} have no products.")
            for product in products:
                text = product.select_one(select.product_name).text
                link = product.select_one(select.product_link).attrs["href"]
                total_price = product.select_one(select.price).text.replace("\xa0", "")
                count = 1
                price = int(total_price.split()[0])

                count_el = product.select_one(select.count)
                if count_el:
                    if m := rgx.match(count_el.text.replace("\xa0", "")):
                        count = int(m.groups()[0])
                        price = int(m.groups()[1])
                if results.get(link):
                    c = results[link]["count"]
                    results[link]["count"] = c + count
                    results[link]["total_price"] = (count + c) * price
                else:
                    results[link] = dict(
                        total_price=price,
                        text=text,
                        count=count,
                        price=price,
                        state=state,
                        order_date=order_date,
                        order_name=order_name,
                    )
    except Exception as e:
        print("can't parse", order_name, e)

    return results
