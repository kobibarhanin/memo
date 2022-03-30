pragma solidity ^0.8.12;

contract Memo {
    
    struct Message {
        string content;
        address source;
        uint256 timestamp;
    }
    
    struct User {
        string uAlias;
        bytes key;
        address uAddress;
    }

    address public manager;
    
    mapping(address => User) public users;
    mapping(string => User) public aliases;

    mapping(address => Message[]) public userMemos; // for each user - the memos he is received
    mapping(address => uint256) public userMemosCount; // for each user - the amount of memos he is received

    constructor() {
        manager = msg.sender;
    }

    function enroll(string memory uAlias, bytes memory key) public payable {
        require(getUserAddress(uAlias) == address(0), 'alias already taken');
        User memory newUser = User({
           uAlias: uAlias,
           key: key,
           uAddress: msg.sender
        });
        users[msg.sender] = newUser;
        aliases[uAlias] = newUser;
    }

    function sendMemo(string memory uAlias, string memory content) public payable {
        address target = getUserAddress(uAlias);
        require(target != msg.sender, 'no self memoing allowed');
        require(target != address(0), 'alias unknown');
        sendMemoToAddress(target, content);
    }
    
    function getMemo(uint256 idx) public view returns (address source, string memory content) {
        if (idx >= userMemosCount[msg.sender]){
            return (address(0), "no memo at index");
        }
        return (userMemos[msg.sender][idx].source, userMemos[msg.sender][idx].content);
    }

    function sendMemoToAddress(address target, string memory content) internal {
        Message memory newMessage = Message({
           content: content,
           source: msg.sender,
           timestamp: block.timestamp
        });
        userMemos[target].push(newMessage);
        userMemosCount[target] +=1;
    }

    function getMemoCount(address user) public view returns (uint256 count) {
        return userMemosCount[user];
    }
    
    function getUserAlias(address user) public view returns (string memory uAlias) {
        return users[user].uAlias;
    }
    
    function getUserAddress(string memory uAlias) public view returns (address uAddress) {
        return aliases[uAlias].uAddress;
    }   

    function getUserKey(string memory uAlias) public view returns (bytes memory pkey) {
        address target = getUserAddress(uAlias);
        require(target != address(0), 'alias unknown');
        return users[target].key;
    }
    
}