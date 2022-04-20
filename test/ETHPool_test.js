const ETHPoolContract = artifacts.require("ETHPool");

contract("ETHPool", accounts => {

  const T = accounts[0];
  const A = accounts[1];
  const B = accounts[2];

  it('A deposits 100, T deposit 100, withdrawal 200.'
    , async () => {
      const ETHPool = await ETHPoolContract.new();
      await ETHPool.userDeposit({ from: A, value: 100 });
      await ETHPool.rewardsDeposit({ from: T, value: 100 });

      let withdrawalDeposit1 = await ETHPool.withdrawDeposit.call(100, { from: A });
      withdrawalDeposit1 = withdrawalDeposit1.words[0];

      let calculateRewards = await ETHPool.calculateRewards.call({ from: A });
      calculateRewards = calculateRewards.words[0];

      let claimedRewards = await ETHPool.claimRewards.call({ from: A });
      claimedRewards = claimedRewards.words[0];

      let totalWithdrawals = claimedRewards + withdrawalDeposit1;

      assert(totalWithdrawals === 200);
    });

  it('A deposits 100, and B deposits 300 for a total of 400 in the pool. Now A has 25% of the pool and B has 75%. When T deposits 200 rewards, A should be able to withdraw 150 and B 450.'
    , async () => {
      let ETHPool = await ETHPoolContract.new()
      await ETHPool.userDeposit({ from: A, value: 100 });
      await ETHPool.userDeposit({ from: B, value: 300 });
      await ETHPool.rewardsDeposit({ from: T, value: 200 });

      let withdrawalDeposit1 = await ETHPool.withdrawDeposit.call(100, { from: A });
      withdrawalDeposit1 = withdrawalDeposit1.words[0];

      let claimRewards1 = await ETHPool.claimRewards.call({ from: A });
      claimRewards1 = claimRewards1.words[0];

      let withdrawalDeposit2 = await ETHPool.withdrawDeposit.call(300, { from: B });
      withdrawalDeposit2 = withdrawalDeposit2.words[0];

      let claimRewards2 = await ETHPool.claimRewards.call({ from: B });
      claimRewards2 = claimRewards2.words[0];

      let totalWithdrawalA = withdrawalDeposit1 + claimRewards1;
      let totalWithdrawalB = withdrawalDeposit2 + claimRewards2;

      assert(totalWithdrawalA === 150);
      assert(totalWithdrawalB === 450);
    });


  it(' A deposits then T deposits then B deposits then A withdraws and finally B withdraws. A should get their deposit + all the rewards. B should only get their deposit because rewards were sent to the pool before they participated.'
    , async () => {
      let ETHPool = await ETHPoolContract.new()
      await ETHPool.userDeposit({ from: A, value: 100 });
      await ETHPool.rewardsDeposit({ from: T, value: 200 });
      await ETHPool.userDeposit({ from: B, value: 300 });

      let withdrawalDeposit1 = await ETHPool.withdrawDeposit.call(100, { from: A });
      withdrawalDeposit1 = withdrawalDeposit1.words[0];

      let claimRewards1 = await ETHPool.claimRewards.call({ from: A });
      claimRewards1 = claimRewards1.words[0];

      let withdrawalDeposit2 = await ETHPool.withdrawDeposit.call(300, { from: B });
      withdrawalDeposit2 = withdrawalDeposit2.words[0];

      let claimRewards2 = await ETHPool.claimRewards.call({ from: B });
      claimRewards2 = claimRewards2.words[0];

      let totalWithdrawalA = withdrawalDeposit1 + claimRewards1;
      let totalWithdrawalB = withdrawalDeposit2 + claimRewards2;

      assert(totalWithdrawalA === 300);
      assert(totalWithdrawalB === 300);
    });

  it(' A deposits 100, B deposits 100, then T deposits 200. Then A deposits 200, B deposits 200, Then T deposits 300. A&B should withdrawal 100+100 + 200+150 = 550 '
    , async () => {
      let ETHPool = await ETHPoolContract.new()
      await ETHPool.userDeposit({ from: A, value: 100 });
      await ETHPool.userDeposit({ from: B, value: 100 });
      await ETHPool.rewardsDeposit({ from: T, value: 200 });
      await ETHPool.userDeposit({ from: A, value: 200 });
      await ETHPool.userDeposit({ from: B, value: 200 });
      await ETHPool.rewardsDeposit({ from: T, value: 300 });

      let withdrawalDeposit1 = await ETHPool.withdrawDeposit.call(300, { from: A });
      withdrawalDeposit1 = withdrawalDeposit1.words[0];

      let claimRewards1 = await ETHPool.claimRewards.call({ from: A });
      claimRewards1 = claimRewards1.words[0];

      let withdrawalDeposit2 = await ETHPool.withdrawDeposit.call(300, { from: B });
      withdrawalDeposit2 = withdrawalDeposit2.words[0];

      let claimRewards2 = await ETHPool.claimRewards.call({ from: B });
      claimRewards2 = claimRewards2.words[0];

      let totalWithdrawalA = withdrawalDeposit1 + claimRewards1;
      let totalWithdrawalB = withdrawalDeposit2 + claimRewards2;

      assert(totalWithdrawalA === 550);
      assert(totalWithdrawalB === 550);
    });
})