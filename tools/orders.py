from dataclasses import dataclass
import re

rgx = re.compile("(\d+)\sшт\sпо\s(\d+)")

class ParseException(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return f"ParseError: {self.msg}"



@dataclass
class Selectors:
    ship: str
    ship_state: str
    product: str
    product_name: str
    price: str
    count: str
    order_date: str
    order_name: str
    order_price: str




select = Selectors(
        **{"ship":".sf1_14",
           "ship_state":".ue_14",
           "product":".q9f_14",
           "price":".d7014-a2",
           "count":".tsBodyControl500Medium",
           "product_name":".rf5_14",
           "order_name":".tsHeadline700XLarge",
           "order_date":".tsBody400Small",
           "order_price":".f6z_14"}
)

def safe_text(soup, selector, context):
    try:
        return soup.select_one(selector).text.strip()
    except AttributeError:
        print(f"error when try to parse {selector} in {context}")
        return None

def parse(soup, printer):
    results = {}
    order_name = safe_text(soup, select.order_name, "order_name")
    order_date = safe_text(soup, select.order_date, "orded_date")
    ships = soup.select(select.ship)
    printer(f"got ships {len(ships)}")
    for idx, ship in enumerate(ships):
        # local delivery
        try: 
            if ship.select_one(select.ship_state):
                state = ship.select_one(select.ship_state).text.strip()
            # foreign delivery
            else:
                state = "Foregn"
        except Expection as e:
            raise ParseException(f"ship: {idx}: {e}")


        products = ship.select(select.product)
        printer(f"ship {state=} in {order_name=} have {len(products)} products")
        if len(products) == 0:
            printer("order {order_name} have no products.")
        for product in products:
            try:
                text = product.select_one(select.product_name).text
            except AttributeError:
                print(f"error when try to parse {select.product_name} in {product}")

            link = product.select_one(select.product_name).attrs["href"]
            total_price = product.select_one(select.price).text.replace("\xa0", "").replace(',',".")
            count = 1
            price = float(total_price.split()[0])

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

    return results
