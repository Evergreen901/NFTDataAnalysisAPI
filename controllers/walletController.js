const PAGESIZE = 50;

const sortFunc = (a, b) => b[1] - a[1];

const sortAndSplice = (obj) =>
  Object.entries(obj)
    .sort(sortFunc)
    .splice(page * PAGESIZE, PAGESIZE);

const getTransactions = (abbr) =>
  abbr === 'eth'
    ? require('../models/ethTransactions')
    : require('../models/solTransactions');

const getValueSeries = (abbr) =>
  abbr === 'eth'
    ? require('../models/ethValueSeries')
    : require('../models/solValueSeries');

// get floor price
const getFloorPrice = async ({
  abbr = 'eth',
  address = () => {
    console.error(
      `Must specify the ${
        abbr === 'eth' ? 'collection address' : 'token address'
      } to get floor price`,
    );
    return undefined;
  },
  from = new Date().getTime() - 86400000,
  to = new Date().getTime(),
}) => {
  const { transactions } = getTransactions(abbr);

  const tokenCondition =
    abbr === 'eth'
      ? { 'data.collectionAddress': address }
      : { 'data.tokenAddress': address };

  const activities = await transactions.aggregate([
    {
      $match: {
        createdAt: {
          $gte: ISODate(new Date(from)),
          $lte: ISODate(new Date(to)),
        },
        instruction: 'Sale',
        ...tokenCondition,
      },
    },
  ]);

  const fp = Math.min(...activities.map((itm) => itm.data.price ?? 0));

  return fp;
};

const getMarketplaceActivities = async (req, res) => {
  try {
    const {
      abbr = 'eth',
      wallet = () => {
        const msg = 'Must specify the wallet address to get fp';
        console.error(msg);
        res.send({ status: 'err', message: msg });
        return;
      },
      from = new Date().getTime() - 86400000,
      to = new Date(),
      page = 0,
    } = req.body;

    const { transactions } =
      abbr === 'eth'
        ? require('../models/ethTransactions')
        : require('../models/solTransactions');

    const activities = await transactions.aggregate([
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
      abbr = 'eth',
      from = new Date().getTime() - 86400000,
      to = new Date().getTime(),
      page = 0,
    } = req.body;

    const { transactions } = getTransactions(abbr);
    const activities = await transactions.aggregate([
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
    let fpList = {};

    for await (const activity of activities) {
      const { seller, buyer, collectionAddress, tokenAddress, price } =
        activity.data;

      const fp =
        fpList[collectionAddress] ??
        getFloorPrice({
          abbr,
          address: abbr === 'eth' ? collectionAddress : tokenAddress,
          from,
          to,
        });
      fpList[collectionAddress] = fp;

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

    sellAmountLeaderboard = sortAndSplice(sellAmountLeaderboard);
    sellCountLeaderboard = sortAndSplice(sellCountLeaderboard);
    buyAmountLeaderboard = sortAndSplice(buyAmountLeaderboard);
    buyCountLeaderboard = sortAndSplice(buyCountLeaderboard);
    pnlLeaderboard = sortAndSplice(pnlLeaderboard);

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
      abbr = 'eth',
      wallet = () => {
        const msg = 'Must specify the wallet address to get fp';
        console.error(msg);
        res.send({ status: 'err', message: msg });
        return;
      },
      from = new Date().getTime() - 86400000,
      to = new Date().getTime(),
    } = req.body;

    const { transactions } = getTransactions(abbr);

    const activities = await transactions.aggregate([
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
    let fpList = {};

    for await (const activity of activities) {
      const { seller, buyer, collectionAddress, tokenAddress, price } =
        activity.data;

      const fp =
        fpList[collectionAddress] ??
        getFloorPrice({
          abbr,
          address: abbr === 'eth' ? collectionAddress : tokenAddress,
          from,
          to,
        });
      fpList[collectionAddress] = fp;

      pnl += seller === wallet ? price - fp : fp - price;
    }

    res.status(200).json({ pnl });
  } catch (err) {
    console.log({ err });
    res.send({ status: 'err', message: err });
  }
};

const getPortfolioValue = async (req, res) => {
  try {
    const {
      abbr = 'eth',
      wallet = () => {
        const msg = 'Must specify the wallet address to get fp';
        console.error(msg);
        res.send({ status: 'err', message: msg });
        return;
      },
      from = new Date().getTime() - 86400000,
      to = new Date().getTime(),
    } = req.body;

    const firstDay = new Date(from).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const { valueSeries } = getValueSeries(abbr);
    const values = await valueSeries.aggregate([
      {
        $match: {
          updatedAt: {
            $lte: ISODate(new Date(to)),
          },
          wallet,
        },
      },
      { $sort: { updatedAt: 1 } },
    ]);

    let data = values.map((itm) => [
      new Date(itm.updatedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      itm.value,
      new Date(itm.updatedAt).getTime() - from,
    ]);

    const next = data.filter((itm) => itm[2] >= 0);
    if (!next?.[0] || next?.[0][2] >= 86400000) {
      const prev = data.filter((itm) => itm[2] < 0);

      if (!next?.[0] && (!prev || prev.length === 0)) {
        data = [];
      } else if (!next?.[0]) {
        data = [[firstDay, prev.at(-1)[1], prev.at(-1)[2]]];
      } else {
        data = [
          !prev || prev.length === 0
            ? [firstDay, next[0][1], 0]
            : [firstDay, prev.at(-1)[1], prev.at(-1)[2]],
          ...next,
        ];
      }
    }

    res.status(200).json(data.map((itm) => [itm[0], itm[1]]));
  } catch (err) {
    console.log({ err });
    res.send({ status: 'err', message: err });
  }
};

module.exports = {
  getMarketplaceActivities,
  getActivitiesRanking,
  getProfitAndLoss,
  getPortfolioValue,
};
