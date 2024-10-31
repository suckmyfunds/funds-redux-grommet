#!python

import click
from tqdm import tqdm
import bs4
from prompt_toolkit import prompt
from prompt_toolkit.completion import FuzzyWordCompleter

from base import cli
from pull import orders, refunds
from parse import parse_orders, parse_refunds


def fill_categories():
    if os.path.exists("categories"):
        with open("categories") as f:
            categories = [l.strip() for l in f.readlines()]
    else:
        categories = [
            "Еда",
            "Домхоз",
            "Подарки",
            "Кот",
            "Развлечения",
            "Конь",
            "Машина",
            "Медицина",
            "Отбираловка",
            "Собака",
            "Хобби Аня",
            "Хобби Дима",
            "Старость",
            "На дом",
            "ипотека",
            "Куры",
            "Перепелки",
            "Рабочий",
        ]

    completer = FuzzyWordCompleter(words=categories)
    for link, data in products:
        text = data["text"]
        total_price = data["total_price"]
        price = data["price"]
        if total_price != price:
            raise Exception(
                "price not match. check count,price and total_price selectors"
            )
        data["category"] = category
        category = prompt(text + ": ", completer=completer, complete_while_typing=True)


if __name__ == "__main__":
    cli()
