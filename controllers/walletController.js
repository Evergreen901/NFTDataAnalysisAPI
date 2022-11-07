const { transactions: solTransactions } = require('../models/solTransactions');
const { transactions: ethTransactions } = require('../models/ethTransactions');

const PAGESIZE = 50;

const getMarketplaceActivities = async (req, res) => {
  try {
    const {
      wallet,
      from = new Date().getTime() - 86400000,
      to = new Date(),
      page = 0,
    } = req.body;

    const activities = await ethTransactions.aggregate([
      {
        $match: {
          createdAt: {
            $gte: ISODate(new Date(from)),
            $lte: ISODate(new Date(to)),
          },
          $or: [{ 'data.buyer': wallet, 'data.seller': wallet }],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: page * PAGESIZE },
      { $limit: PAGESIZE },
    ]);

    res.status(200).json(activities);
  } catch (err) {
    console.log({ err });
    res.send({ status: 'err', message: err });
  }
};

const getActivitiesRanking = async (req, res) => {
  try {
    const {
      from = new Date().getTime() - 86400000,
      to = new Date().getTime(),
      page = 0,
    } = req.body;

    const activities = await ethTransactions.aggregate([
      {
        $match: {
          createdAt: {
            $gte: ISODate(new Date(from)),
            $lte: ISODate(new Date(to)),
          },
        },
      },
    ]);

    let sellAmountLeaderboard = {};
    let sellCountLeaderboard = {};
    let buyAmountLeaderboard = {};
    let buyCountLeaderboard = {};
    let pnlLeaderboard = {};

    for await (const activity of activities) {
      const { seller, buyer, collectionAddress, price } = activity.data;
      const fp = getFloorPrice({ collectionAddress, from, to });

      if (seller) {
        sellAmountLeaderboard[seller] ??= 0;
        sellAmountLeaderboard[seller] += price;
        sellCountLeaderboard[seller] ??= 0;
        sellCountLeaderboard[seller]++;
        pnlLeaderboard[seller] += price - fp;
      }

      if (buyer) {
        buyAmountLeaderboard[buyer] ??= 0;
        buyAmountLeaderboard[buyer] += price;
        buyCountLeaderboard[buyer] ??= 0;
        buyCountLeaderboard[buyer]++;
        pnlLeaderboard[buyer] += fp - price;
      }
    }

    sellAmountLeaderboard = Object.entries(sellAmountLeaderboard)
      .sort(sortFunc)
      .splice(page * PAGESIZE, PAGESIZE);
    sellCountLeaderboard = Object.entries(sellCountLeaderboard)
      .sort(sortFunc)
      .splice(page * PAGESIZE, PAGESIZE);
    buyAmountLeaderboard = Object.entries(buyAmountLeaderboard)
      .sort(sortFunc)
      .splice(page * PAGESIZE, PAGESIZE);
    buyCountLeaderboard = Object.entries(buyCountLeaderboard)
      .sort(sortFunc)
      .splice(page * PAGESIZE, PAGESIZE);
    pnlLeaderboard = Object.entries(pnlLeaderboard)
      .sort(sortFunc)
      .splice(page * PAGESIZE, PAGESIZE);

    res.status(200).json({
      sellAmountLeaderboard,
      sellCountLeaderboard,
      buyAmountLeaderboard,
      buyCountLeaderboard,
      pnlLeaderboard,
    });
  } catch (err) {
    console.log({ err });
    res.send({ status: 'err', message: err });
  }
};

const getProfitAndLoss = async (req, res) => {
  try {
    const {
      wallet,
      from = new Date().getTime() - 86400000,
      to = new Date().getTime(),
    } = req.body;

    const activities = await ethTransactions.aggregate([
      {
        $match: {
          createdAt: {
            $gte: ISODate(new Date(from)),
            $lte: ISODate(new Date(to)),
          },
          $or: [{ 'data.buyer': wallet, 'data.seller': wallet }],
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: page * PAGESIZE },
      { $limit: PAGESIZE },
    ]);

    let pnl = 0;

    for await (const activity of activities) {
      const { seller, buyer, collectionAddress, price } = activity.data;
      const fp = getFloorPrice({ collectionAddress, from, to });

      pnl += seller === wallet ? price - fp : fp - price;
    }

    res.status(200).json({ pnl });
  } catch (err) {
    console.log({ err });
    res.send({ status: 'err', message: err });
  }
};

// TODO get timeseries of portfolio value
const getPortfolioValue = async (req, res) => {
  try {
    const {
      wallet,
      from = new Date().getTime() - 86400000,
      to = new Date().getTime(),
    } = req.body;
    let data = [];
    res.status(200).json(data);
  } catch (err) {
    console.log({ err });
    res.send({ status: 'err', message: err });
  }
};

const sortFunc = (a, b) => b[1] - a[1];

// get floor price
const getFloorPrice = async ({
  collectionAddress = () => {
    console.error('Must specify the collection address to get fp');
    return undefined;
  },
  from = new Date().getTime() - 86400000,
  to = new Date().getTime(),
}) => {
  const activities = await ethTransactions.aggregate([
    {
      $match: {
        createdAt: {
          $gte: ISODate(new Date(from)),
          $lte: ISODate(new Date(to)),
        },
        'data.collectionAddress': collectionAddress,
        instruction: 'Sale',
      },
    },
  ]);

  const fp = Math.min(...activities.map((itm) => itm.data.price ?? 0));

  return fp;
};

module.exports = {
  getMarketplaceActivities,
  getActivitiesRanking,
  getProfitAndLoss,
  getPortfolioValue,
};
