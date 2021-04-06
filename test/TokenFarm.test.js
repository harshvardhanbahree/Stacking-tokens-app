const { assert } = require('chai')

const TokenFarm = artifacts.require("TokenFarm")
const DaiToken = artifacts.require("DaiToken")
const DappToken = artifacts.require("DappToken")

require('chai')
    .use(require('chai-as-promised'))
    .should()

    function tokens(n){
        return web3.utils.toWei(n,'ether');
    }
contract("TokenFarm",([owner,investor]) =>{

    let daiToken,dappToken,tokenFarm;
    //before function is a function that willbe called before every test that is written below it is just like a constructor
    
    before(async ()=>{
        //Load Contracts just like the TokenFarm contract
      daiToken = await DaiToken.new()
      dappToken = await DappToken.new();
      tokenFarm = await TokenFarm.new(dappToken.address,daiToken.address);
      
      //Transfer all the dapp token to the TokenFarm
      await dappToken.transfer(tokenFarm.address,tokens('1000000'));

        await daiToken.transfer(investor,tokens('100'),{from:owner })
    })

    describe("Mock DAI deployment",async()=>{
    it('has a name',async()=>{
        const name = await daiToken.name()
        //console.log(name);
        assert.equal(name,"Mock DAI Token");
        })
    })

    describe ('Dapp Token deployment',async()=>{
        it('has a name',async() =>{
            const name = await dappToken.name();
            assert.equal(name,"DApp Token");
        })
    })

    describe ('Token Farm deployment',async()=>{
        it('has a name',async() =>{
            const name = await tokenFarm.name();
            assert.equal(name,"Dapp Token Farm");
        })

        it("contract has token",async()=>{
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(),tokens('1000000'));

        })
    })
    
    describe('Farming Tokens',async()=>{
        it('rewards investors for staking Dai tokens',async()=>{
            let results;

            results = await daiToken.balanceOf(investor)
            assert.equal(results.toString(),tokens('100'),'investor Dai wallet balance correct befor staking');
            await daiToken.approve(tokenFarm.address,tokens('100'),{from : investor});
            await tokenFarm.stakeToken(tokens('100'),{from : investor});

            // investor should not have any dai token because it just moved to tokenFarm
            results = await daiToken.balanceOf(investor)
            assert.equal(results.toString(),tokens('0'),'Investor balance is correct');
            
            // // token farm should now have 100 dai token because it just recieved 100 dai token
            results = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(results.toString(),tokens("100"),"TokenFarm balance is correct");

            // //now we should check the stakingBalance(map in contract) which is the amount in TokenFarm becuase it just recived the 100
            results = await tokenFarm.stakingBalance(investor);
            assert.equal(results.toString(),tokens("100"),"Staking balance is Correct");

            results = await tokenFarm.isStaked(investor);
            assert.equal(results.toString(),"true","Staking balance is Correct");

            // Issue Tokens
            await tokenFarm.issueTokens({from:owner});
            results = await dappToken.balanceOf(investor);
            assert.equal(results.toString(),tokens("100"),"Investor has 100 dapp token in return for 100 dai token")
            
            await tokenFarm.issueTokens({from : investor}).should.be.rejected;


            await tokenFarm.unstakeTokens({from : investor})

            results = await daiToken.balanceOf(investor);
            assert.equal(results.toString(),tokens("100"),'Investor got there dai tokens back')
            
            results = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(results.toString(),tokens("0"),'Token farm  dai tokens should be 0')
 
            results = await tokenFarm.stakingBalance(investor);
            assert.equal(results.toString(),tokens("0"),'Investors farmToken should be 0')
 
            results = await tokenFarm.isStaked(investor);
            assert.equal(results.toString(),"false",'investors staking status should be false')
 
 
        })
    })





})    