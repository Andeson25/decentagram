// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.8;

contract Decentagram {
    string public name = "Decentagram";

    // Store Posts
    uint256 public postCount = 0;
    mapping(uint256 => Post) public posts;

    struct Post {
        uint256 id;
        string hash;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    // Post created event
    event PostCreated(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    // Post Tipped event
    event PostTipped(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    // Create Posts
    function createPost(string memory _postHash, string memory _description) public {
        // Validate data
        require(bytes(_postHash).length > 0);
        require(bytes(_description).length > 0);
        require(msg.sender != address(0x0));

        // Increment counter
        postCount++;

        // Add Post to contract
        posts[postCount] = Post(
            postCount,
            _postHash,
            _description,
            0,
            msg.sender
        );

        // Trigger an event
        emit PostCreated(postCount, _postHash, _description, 0, msg.sender);
    }

    // Tip Posts
    function tipPostOwner(uint256 _id) public payable {
        // Validate data
        require(_id > 0 && _id <= postCount);

        // Fetch image
        Post memory _post = posts[_id];

        // Fetch author
        address payable _author = _post.author;

        // Transfer ether
        address(_author).transfer(msg.value);

        // Update tip amount
        _post.tipAmount = _post.tipAmount + msg.value;

        // Update post
        posts[_id] = _post;

        // Trigger Post tipper event
        emit PostTipped(
            _id,
            _post.hash,
            _post.description,
            _post.tipAmount,
            _author
        );
    }
}
