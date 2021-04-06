pragma solidity ^0.5.16;
import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{

    string public name ="Dapp Token Farm";
    
    DaiToken public daiToken;
    DappToken public dappToken;
    address public owner;

    address[] stakers;

    mapping(address=>uint) public stakingBalance;
    mapping(address => bool ) public hasStaked;
    mapping(address => bool ) public isStaked;

    constructor(DappToken _dappToken,DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. Stake tokens (deposit)
    function stakeToken(uint _amount) public {
        require(_amount > 0,"The amount should be grater than 0");

        //1.Transfer Dai tokens from the investor to this contract

        daiToken.transferFrom(msg.sender, address(this), _amount);
        //2. stacking balance and recording who owns or has send how many dai tokens 
        stakingBalance[msg.sender] =  _amount + stakingBalance[msg.sender];

        //3. Add users to stacker array *only * if they havent stacked already *by default everyone is false* 
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }
       
            hasStaked[msg.sender] = true;
            isStaked[msg.sender] = true;
    }


    //2. Unstaking tokens(withdraw)

    function unstakeTokens() public {
        uint balance =  stakingBalance[msg.sender];
        require(balance > 0 ,"Staking balance should be greater then 0 ");

        daiToken.transfer(msg.sender,balance);
        stakingBalance[msg.sender] = 0;

           isStaked[msg.sender] =false; 

    }
    //3. Issuing tokens

    function issueTokens() public {
        require(msg.sender == owner ,"The calling of this function should only be done by the owner of this token");

        for(uint i=0;i<stakers.length;i++)
        {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];    
            if(balance > 0)
            dappToken.transfer(recipient,balance);

        }
    }
}
