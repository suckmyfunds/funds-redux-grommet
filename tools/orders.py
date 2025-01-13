from dataclasses import dataclass
import re
from base import price_parse, select_alt


rgx = re.compile("(\d+)\s?x\s?(\d+)\s?₽")

class ParseException(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return f"ParseError: {self.msg}"


@dataclass
class OrderItem:
    id: str
    count: int
    price: float
    text: str


@dataclass
class Order:
    date: str
    id: str
    products: list[OrderItem]
    state: str
    total_price: float

    @property
    def total_price_check(self):
        return self.total_price == sum([p.price for p in self.products])


@dataclass
class Selectors:
    ship: str
    ship_state: str
    product: str
    product_name: str
    price: str
    count: str
    order_date: str
    order_price: str


select = Selectors(
    **{
        "ship": ".ng0_14",
        "ship_state": ".tsHeadline550Medium",
        "product": ".m5g_14",
        "price": ".c3022-a1",
        "count": ".c3022-b2",
        "product_name": ".g7m_14.m7g_14",
        "order_date": ".x2.g4o_14",
        "order_price": ".f0y_14 > div:nth-child(2) .yf_14",
    }
)

ZAKAZ_OT = "Заказ от"

month_num = {
        "января": "01",
        "февраля": "02",
        "марта": "03",
        "апреля": "04",
        "мая": "05",
        "июня": "06",
        "июля": "07",
        "августа": "08",
        "сентября": "09",
        "октября": "10",
        "ноября": "11",
        "декабря": "12",
        }


def parse(soup, printer, order_name):
    try:
        order_date = select_alt(soup, select.order_date).text.strip()
    except Exception as e:
        raise ParseException(f"can't parse order_date {select.order_date}: '{e}'")

    results = {}


    if ZAKAZ_OT in order_date:
        order_date = order_date[len(ZAKAZ_OT):].strip()
        day_number, month = order_date.split()
        order_date = f"{day_number.strip()}.{month_num[month.strip()]}.2024"
    ships = soup.select(select.ship)
    if ships is None or len(ships) == 0:
        ParseException(f"No any ship found with {select.ship}")

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

            link = text.strip() # product.select_one(select.product_name).attrs["href"]
            price = price_parse(product.select_one(select.price).text)
            count = 1

            count_el = product.select_one(select.count)
            if count_el:
                t = count_el.text.replace("\xa0", "")
                if m := rgx.match(t):
                    count = int(m.groups()[0])
                    price = int(m.groups()[1])
                else:
                    raise ParseException(f"count regexp not match with: {t}")
                        
            if results.get(link):
                c = results[link]["count"]
                results[link]["count"] = c + count
                results[link]["total_price"] = (count + c) * price
            else:
                results[link] = dict(
                    total_price=price,
                    text=text,
                    count=count,
                    amount=price,
                    state=state,
                    order_date=order_date,
                    order_id=order_name,
                )

    return results
