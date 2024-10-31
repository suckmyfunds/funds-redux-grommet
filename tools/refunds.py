from dataclasses import dataclass
import bs4


@dataclass
class Selectors:
    order_id: str
    product_link: str
    state: str
    compensation: str


select = Selectors(
        order_id=".b211-b0 > button > div",
    product_link=".wu3_30",
    state=".b211-b0",
    compensation="div.tw9_30:nth-child(1) > div:nth-child(2) > div:nth-child(1)"
)


def parse(soup: bs4.BeautifulSoup, refund_id:str, printer) -> dict:
    result = dict() 
    result["order_id"] = soup.select_one(select.order_id).text.strip()
    result["state"] = soup.select_one(select.state).text.strip()
    if result["state"] == "Частичная компенсация отправлена":
        result["compensation"] = soup.select_one(select.compensation).text.strip()
    product_links = list(map(lambda x: x.attrs["href"].replace('/product/','').strip(), soup.select(select.product_link)))
    result["refund_id"] = refund_id
    return {product: result for product in product_links}
