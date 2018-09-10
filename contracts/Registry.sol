pragma solidity ^0.4.24;

import "../../rayonprotocol-contract-common/contracts/RayonBase.sol";

contract Registry is RayonBase {
    struct RegistryEntry {
        uint256 index;
        string name;
        address contractAddress;
        uint16 version;
        uint256 updatedTime;
    }
    mapping(string => RegistryEntry) internal contractMap;
    // mapping(string => mapping(uint16 => RegistryEntry)) internal contractHistoryMap;
    string[] internal contractNameList;

    // Event defination
    event LogContractRegistered(string name, address contractAddress);
    event LogContractUpgraded(string name, address contractAddress);

    constructor(uint16 version) RayonBase("Registry", version) public {}

    function register(address _contractAddress) public onlyOwner {
        require(_contractAddress != address(0), "contract address cannot be 0x0");
        RayonBase rayonContract = RayonBase(_contractAddress);
        uint16 version = rayonContract.getVersion();
        string memory name = rayonContract.getName();

        RegistryEntry storage entry = contractMap[name];
        require(version > entry.version, "version of contract to register must be greater than current version");

        entry.contractAddress = _contractAddress;
        entry.version = version;
        entry.updatedTime = now;
        if(!_contains(entry)){ // new contract
            entry.index = contractNameList.push(name);
            entry.name = name;
            emit LogContractRegistered(name, _contractAddress);

            // new proxy contract deploy
            // it will be implemented on next step
        }else{ // upgraded contract
            emit LogContractUpgraded(name, _contractAddress);
        }
    }

    function upgrade(address _contractAddress) public onlyOwner {
        register(_contractAddress);
    }

    function upgradeAll(address[] _contractAddressList) public onlyOwner {
        for(uint i; i<_contractAddressList.length; i++){
            register(_contractAddressList[i]);
        }
    }

    function getRegistryInfo(string memory _name) public view returns (string, address, uint16, uint256) {
        RegistryEntry storage entry = contractMap[_name];
        require(_contains(entry), "contract must be present in map");
        return (entry.name, entry.contractAddress, entry.version, entry.updatedTime);
    }

    function getRegistryInfoByIndex(uint _index) public view onlyOwner returns (string, address, uint16, uint256) {
        require(_index >= 0, "index must be in range");
        require(_index < contractNameList.length, "index must be in range");

        string memory name = contractNameList[_index];
        return getRegistryInfo(name);
    }

    function _contains(RegistryEntry memory _entry) private pure returns (bool){
        return (bytes(_entry.name).length > 0) && (_entry.contractAddress != address(0));
    }

    function contains(string memory _name) public view returns (bool) {
        RegistryEntry storage entry = contractMap[_name];
        return _contains(entry);
    }

    function size() public view onlyOwner returns (uint) {
        return contractNameList.length;
    }

}