pragma solidity ^0.4.24;

interface EIP20Standard {
  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  function name() external view returns (string);
  function symbol() external view returns (string);
  function decimals() external view returns (uint8);
  function totalSupply() external view returns (uint256);

  function balanceOf(address _owner) external view returns (uint256 balance);
  function allowance(address _owner, address _spender) external view returns (uint256 remaining);

  function transfer(address _to, uint256 _value) external returns (bool success);
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
  function approve(address _spender, uint256 _value) external returns (bool success);
}