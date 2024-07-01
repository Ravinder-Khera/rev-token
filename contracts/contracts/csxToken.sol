

pragma solidity ^0.8.25;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CentralisX is Ownable,ERC20{
    
    constructor(uint256 _totalSupply, string memory name,string memory symbol) ERC20(name,symbol) Ownable(msg.sender) public{
        _mint(msg.sender, _totalSupply);
    }

    function burn(uint256 value) external {
        _burn(msg.sender, value);
    }
}

