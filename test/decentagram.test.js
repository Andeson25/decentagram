/* eslint-disable no-undef,jest/valid-describe */
const Decentagram = artifacts.require('./Decentagram');

require('chai')
    .use(require('chai-as-promised'))
    .should();
const ERROR_MSG = 'VM Exception while processing transaction: revert';
const getBalance = async author => {
    return new web3.utils.BN(
        await web3.eth.getBalance(author)
    );
};

contract('Decentagram', ([deployer, author, tipper]) => {
    let decentagram;
    beforeEach(async () => {
        decentagram = await Decentagram.deployed();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await decentagram.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('has a name', async () => {
            const name = await decentagram.name();
            assert.equal(name, 'Decentagram');
        });
    });

    describe('posts', async () => {
        const postHash = 'ABC',
            description = 'Post description';
        let result, postCount;

        beforeEach(async () => {
            result = await decentagram.createPost(
                postHash,
                description,
                {from: author}
            );
            postCount = await decentagram.postCount();
        });

        it('creates posts', async () => {
            assert.equal(postCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is incorrect');
            assert.equal(event.hash, postHash, 'hash is incorrect');
            assert.equal(event.description, description, 'description is incorrect');
            assert.equal(event.tipAmount, '0', 'tip amount is incorrect');
            assert.equal(event.author, author, 'author is incorrect');
        });

        it('should fail with empty post hash', async () => {
            await decentagram.createPost(
                '',
                description,
                {from: author}
            )
                .should.be.rejectedWith(ERROR_MSG);
        });

        it('should fail with empty description', async () => {
            await decentagram.createPost(
                postHash,
                '',
                {from: author}
            )
                .should.be.rejectedWith(ERROR_MSG);
        });

        it('should list posts', async () => {
            const post = await decentagram.posts(postCount);
            assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is incorrect');
            assert.equal(post.hash, postHash, 'hash is incorrect');
            assert.equal(post.description, description, 'description is incorrect');
            assert.equal(post.tipAmount, '0', 'tip amount is incorrect');
            assert.equal(post.author, author, 'author is incorrect');
        });
    });

    describe('allows users to tip posts', async () => {
        const postHash = 'ABC',
            description = 'Post description',
            oneEtherInWei = web3.utils.toWei('1', 'Ether');
        let result,
            postCount,
            oldAuthorBalance,
            newAuthorBalance;


        before(async () => {
            await decentagram.createPost(
                postHash,
                description,
                {from: author}
            );
            postCount = await decentagram.postCount();
            oldAuthorBalance = await getBalance(author);
            result = await decentagram.tipPostOwner(
                postCount,
                {
                    from: tipper,
                    value: oneEtherInWei
                }
            );
            newAuthorBalance = await getBalance(author);
        });

        it('successfully tips post', async () => {
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is incorrect');
            assert.equal(event.hash, postHash, 'Hash is incorrect');
            assert.equal(event.description, description, 'description is incorrect');
            assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is incorrect');
            assert.equal(event.author, author, 'author is incorrect');
        });

        it('should properly increase author balance', async () => {
            const tipPostOwner = new web3.utils.BN(oneEtherInWei),
                expectedBalance = oldAuthorBalance.add(tipPostOwner);
            assert.equal(newAuthorBalance.toString(), expectedBalance.toString());
        });

        it('fails with incorrect post id', async () => {
            await decentagram.tipPostOwner(
                99,
                {
                    from: tipper,
                    value: web3.utils.toWei('1', 'Ether')
                }
            )
                .should.be.rejectedWith(ERROR_MSG);
        });
    });
});
