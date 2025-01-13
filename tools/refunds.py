from dataclasses import dataclass
import bs4
from base import select_alt, price_parse


@dataclass
class Selectors:
    order_id: str
    product_link_relative: str
    product_container: str

    state: str
    compensation: str
    refund_amount: str


select = Selectors(
    order_id="button.ga113-a:nth-child(2) > div:nth-child(1)|button.ga115-a:nth-child(2) > div:nth-child(1)|.ww3_31 .ga120-a2",
    product_link_relative="div > div > div:nth-child(2) > div > a:nth-child(1)",
    product_container=".ww5_31",
    state=".vy4_31 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)|.zt5_30 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)|.x5w_31.aba6_31 .b221-b0",
    compensation="div.uz5_31:nth-child(1) > div:nth-child(2) > div:nth-child(1)|div.vx7_31:nth-child(1) > div:nth-child(2) > div:nth-child(1)",
    refund_amount="div.uz5_31:nth-child(2) > div:nth-child(2) > div:nth-child(1)|div.tw9_30:nth-child(2) > div:nth-child(2) > div:nth-child(1)|div.vx7_31:nth-child(1) > div:nth-child(2) > div:nth-child(1)",
)



def parse(soup: bs4.BeautifulSoup, printer, refund_id: str) -> dict:
    result = dict()

    try:
        result["order_id"] = select_alt(soup, select.order_id).text.strip()
    except Exception as e:
        raise Exception(f"error parse {refund_id} order_id: {str(e)}")
    try:
        result["state"] = select_alt(soup, select.state).text.strip()
    except Exception as e:
        raise Exception(f"error parse {refund_id} state: {str(e)}")

    if result["state"] == "Частичная компенсация отправлена":
        result["compensation"] = select_alt(soup, select.compensation).text.strip()
    product_links = list(
        map(
            lambda x: x.select_one(select.product_link_relative).text.strip(),
            soup.select(select.product_container),
        )
    )
    result["refund_id"] = refund_id
    result["refund_raw"] = select_alt(soup, select.refund_amount).text.strip()
    result["amount"] = price_parse(select_alt(soup, select.refund_amount).text.strip())

    return {product: result for product in product_links}
