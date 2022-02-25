pragma solidity ^0.5.0;

import "./GasDelegationWhitelist.sol";

contract AllocatedDelegationContract is GasDelegationWhitelist {

    /****************************************************************************************************
    *
    * Storage
    *
     ****************************************************************************************************/
    mapping(address => uint256) _balanceOfEoa;

    /****************************************************************************************************
    *
    * Events
    *
    ****************************************************************************************************/
    event GasOfEoaFilled(
        address indexed eoa,
        uint256 indexed amount
    );

    event GasOfEoaRecovered(
        address indexed eoa,
        uint256 indexed amount
    );

    /****************************************************************************************************
    *
    * Constructor
    *
    ****************************************************************************************************/
    constructor(
        address[] memory superWhitelistEntries,
        address[] memory whitelistEntries,
        address payable fundOwnerAddress
    ) GasDelegationWhitelist(
        superWhitelistEntries,
        whitelistEntries,
        fundOwnerAddress
    ) public {

    }

    /****************************************************************************************************
    *
    * Operations (read)
    *
    ****************************************************************************************************/
    function getBalanceOfEoa(address _eoa) public view returns (uint256) {
        return _balanceOfEoa[_eoa];
    }

    /****************************************************************************************************
     *
     * Operations (write)
     *
     ****************************************************************************************************/
    function allocateGasToEoa(address _eoa, uint256 _amount) public onlyFundOwner returns (bool) {
        require(_eoa != address(0));
        _allocateGasToEoa(_eoa, _amount);

        emit GasOfEoaFilled(_eoa, _amount);
        return true;
    }

    function recoverGasOfEoa(address _eoa, uint256 _amount) public onlyFundOwner returns (bool) {
        require(_eoa != address(0));
        require(_balanceOfEoa[_eoa] >= _amount);
        _recoverGasOfEoa(_eoa, _amount);

        emit GasOfEoaRecovered(_eoa, _amount);
        return true;
    }

    function recoverAllGasOfEoa(address _eoa) public onlyFundOwner returns (bool) {
        require(_eoa != address(0));
        require(_balanceOfEoa[_eoa] > 0);
        uint256 balance = _balanceOfEoa[_eoa];
        _recoverGasOfEoa(_eoa, balance);

        emit GasOfEoaRecovered(_eoa, balance);
        return true;
    }

    function _allocateGasToEoa(address _eoa, uint256 _amount) internal {
        if(!isWhitelist(_eoa)) {
            _initWhitelistData(_eoa);
        }
        _balanceOfEoa[_eoa] = _amount;
    }

    function _recoverGasOfEoa(address _eoa, uint256 _amount) internal {
        _balanceOfEoa[_eoa] -= _amount;
    }


}
