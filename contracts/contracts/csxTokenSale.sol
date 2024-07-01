
pragma solidity >=0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ERC20 {
    function transferFrom(address from, address to, uint value) external;
}


contract CXCTokenSale is Ownable,ReentrancyGuard {
    address public paymentToken;
    address public tokenBeingSold;
    uint256 public currentStage;
    address public admin;
    uint256 public totalStages;
    uint256 public totalTokensSoldTillNow;
    address public receiver;

    struct StageStruct {
        uint256 maxTokensForStage;
        uint256 totalTokensSold;
        uint256 price;
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint256 => StageStruct) public stageInfo;

    event BuyTokens(address receiver,uint256 amount);
    event withdrawTokens(address tokenAddress,uint256 amount);


    modifier onlyAdmin(){
        require(msg.sender==admin,"Only Admin Can Call This Function");
        _;
    }
    
    constructor(
        address _paymentToken,
        address _tokenBeingSold,
        address _admin,
        address _receiver
    ) public Ownable(msg.sender){
        paymentToken = _paymentToken;
        tokenBeingSold = _tokenBeingSold;
        admin = _admin;
        receiver = _receiver;
    }

    function addStage(uint256 _maxTokensForStage, uint256 _price, uint256 _startTime, uint256 _endTime, bool _isActive) external onlyAdmin{
        require(_startTime<_endTime,"Start time should be greater than endtime");
        require(_maxTokensForStage>0,"Max cap should be greater than 0");
        uint256 _stage = totalStages + 1;
        stageInfo[_stage] = StageStruct(_maxTokensForStage, 0, _price, _startTime, _endTime);
        if(_isActive==true){
            currentStage = _stage;
        }
        totalStages++;
    }

    function updateStage(uint256 _stage, uint256 _maxTokensForStage, uint256 _price, uint256 _startTime, uint256 _endTime) external onlyAdmin{
        require(_startTime<_endTime,"Start time should be greater than endtime");
        require(_maxTokensForStage>0,"Max cap should be greater than 0");
        StageStruct storage stage = stageInfo[_stage];
        stage.maxTokensForStage = _maxTokensForStage;
        stage.price = _price;
        stage.startTime = _startTime;
        stage.endTime = _endTime;
    }

    function startStage(uint256 _stage) external onlyAdmin{
        require(_stage<=totalStages && _stage>0,"Invalid Stage Id");
        StageStruct storage stage = stageInfo[_stage];
        require(stage.endTime>block.timestamp,"Stage has expired");
        currentStage = _stage;
    }

    function disableSale()  external onlyAdmin{
        currentStage = 0;
    }

    function buyTokens(uint256 _amount) external nonReentrant{
        require(currentStage!=0,"No active stage");
        require(_amount>0,"Zero amount can't be purchased");
        require(receiver!=address(0),"Receiver Is Zero Address");
        uint256 cxcBal = IERC20(tokenBeingSold).balanceOf(address(this));
        require(cxcBal>=_amount,"Contract have insufficient CXC tokens");
        StageStruct storage stage = stageInfo[currentStage];
        require(block.timestamp >= stage.startTime && block.timestamp <= stage.endTime, "Token sale not available at this time");
        require(_amount <= stage.maxTokensForStage - stage.totalTokensSold, "Exceeds stage cap");
        uint256 decimals = IERC20Metadata(tokenBeingSold).decimals();

         ERC20(paymentToken).transferFrom(msg.sender, receiver,( _amount * stage.price)/(10**decimals));
        
        

        // Transfer tokens being sold from admin to buyer
        IERC20(tokenBeingSold).transfer(msg.sender, _amount);
        
        stage.totalTokensSold += _amount;
        totalTokensSoldTillNow += _amount;
        emit BuyTokens(msg.sender, _amount);
    }

    function withdrawDumpedTokens(address token) external onlyAdmin{
        require(receiver!=address(0),"Receiver Is Zero Address");
        IERC20(token).transfer(receiver, IERC20(token).balanceOf(address(this)));
        emit withdrawTokens(token,IERC20(token).balanceOf(address(this)));
    }

    function setReceiverAddress(address _receiver) external onlyAdmin{
        require(receiver!=address(0),"Receiver Is Zero Address");
        receiver = _receiver;
    }

    function setAdmin(address _admin) external onlyAdmin{
        admin = _admin;
    }
}
