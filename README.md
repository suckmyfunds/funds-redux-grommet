# Features
## easy tracking expenses
In CoinKeeper, to write an expense we need to:
- drag and drop from one account to one expence category
- input amount of expenses
- place tags (optional).

So there are 2 actions. In Funds paradigm we have goined expenses category and an account in one object - Fund. So we need:
- input amout of expenses
- place tags (optional)
- press submit. 

### Benefits
Because we merge category and account, we have more space. E.g. in CoinKeeper,
we can see only 4 accounts, so if we need to track expense from 5th, so we have
to do extra "swipe" of accounts line. In our case that may happens only when we
have more than 10 account

## show unsynced list of transactions cross all funds
This app abstracts out how you manage you accounts, cards, wallet. You may have
only one wallet and many funds, so in you wallet 1000$ may be:
- 200$ on "Health" Fund
- 400$ on "Hobby" Fund
- 400$ on "NewCar" Fund.
But in reallity you can use credit card to pay and have few different acconts
(maybe some Investment account) for each Fund, so when you pay from credit card
to "Hobby" you need to move the money from respected account to the credit card
to prevent a fee on some date.

From this point of view, all new tracket transactions marked as "unsynced", and
you can see all of them and "move" the money from account to account for
synchronization reason.

## accumulation of value
Fund paradigm have an accumulation of money on some fund. So you always see (if
you honestly track expenses) how many money you accumulate on the fund.

## planning of new expenses


# Development thinks

## How to pass balance
We have next struct
```
App -> FundsPage -> FundList -> Fund
App -> FundDetailPage -> FundList -> Fund
```
We have currently structure `Fund` which mean `{name, budget, balance, transactions, synced}`. 
`balance` is calculated from `transactions`
`Fund` is passed from `FundList` to `Fund` component.
So we can declare  
