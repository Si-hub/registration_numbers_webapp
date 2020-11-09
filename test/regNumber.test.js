const assert = require('assert');
const Registrations = require('../regNumbers');
const pg = require("pg");
const Pool = pg.Pool;

// we are using a special test database for the tests
const connectionString = process.env.DATABASE_URL || 'postgresql://sim:pg123@localhost:5432/regnumber_tests';

const pool = new Pool({
    connectionString
});

describe('The regNumbers function', function() {


    beforeEach(async function() {
        // clean the tables before each test run
        await pool.query("delete from regNumbers;");

    });

    it('should not add duplicate for Bellville', async function() {

        // the Factory Function is called regFactoryFunction
        let FactoryFunction = Registrations(pool);
        await FactoryFunction.setReg("CY 789 546");


        assert.equal(1, await FactoryFunction.check("CY 789 546"));


    });

    it('should return all registrations from db', async function() {
        let FactoryFunction = Registrations(pool);
        await FactoryFunction.setReg("CY 789 546");
        await FactoryFunction.setReg("CA 123 456");
        await FactoryFunction.setReg("CL 789 258")

        assert.deepStrictEqual(await FactoryFunction.getReg(), [{ reg_number: "CY 789 546" },
            { reg_number: "CA 123 456" },
            { reg_number: "CL 789 258" },

        ]);

    });

    it('should filter and return Bellville registrations only', async function() {

        let FactoryFunction = Registrations(pool);
        await FactoryFunction.setReg("CY 123 666");
        await FactoryFunction.setReg("CY 789 546");
        await FactoryFunction.setReg("CA 123 456");
        await FactoryFunction.setReg("CL 789 258")

        assert.deepStrictEqual(await FactoryFunction.filteringTown(1), [{ reg_number: "CY 123 666" },
            { reg_number: "CY 789 546" }
        ])
    });


    it('should filter and return Cape Town registrations only', async function() {

        let FactoryFunction = Registrations(pool);
        await FactoryFunction.setReg("CA 123 892");
        await FactoryFunction.setReg("CY 789 546");
        await FactoryFunction.setReg("CA 123 456");
        await FactoryFunction.setReg("CL 789 258")

        assert.deepEqual(await FactoryFunction.filteringTown(2), [{ reg_number: "CA 123 892" },
            { reg_number: "CA 123 456" }
        ])
    });

    it('should filter and return Stellenbosch registrations only', async function() {

        let FactoryFunction = Registrations(pool);
        await FactoryFunction.setReg("CA 123 892");
        await FactoryFunction.setReg("CY 789 546");
        await FactoryFunction.setReg("CA 123 456");
        await FactoryFunction.setReg("CL 789 258")

        assert.deepEqual(await FactoryFunction.filteringTown(3), [{ reg_number: "CL 789 258" }])
    });

    it('should filter and return All registrations', async function() {

        let FactoryFunction = Registrations(pool);
        await FactoryFunction.setReg("CY 789 546");
        await FactoryFunction.setReg("CA 123 456");
        await FactoryFunction.setReg("CL 789 258")

        assert.deepStrictEqual(await FactoryFunction.filteringTown('All'), [{ reg_number: "CY 789 546" },
            { reg_number: "CA 123 456" },
            { reg_number: "CL 789 258" },

        ])
    });

    it('should return a message if reg has been added before', async function() {

        let FactoryFunction = Registrations(pool);
        await FactoryFunction.setReg("CA 123 456");

        assert.deepEqual(await FactoryFunction.getReg(2), [{ reg_number: "CA 123 456" }],
            'This registration is already entered!'
        );
    });


    after(function() {
        pool.end();
    });
});