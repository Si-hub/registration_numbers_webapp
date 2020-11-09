module.exports = function regFactoryFunction(pool) {

    async function setReg(enteredReg) {

        let town_tag = enteredReg.substring(0, 2)
            // console.log(town_tag)
            // var enteredReg = enteredReg.length <= 10
        let town_id = await pool.query("select id from towns where start_string=$1", [town_tag])
        let townsid = town_id.rows[0].id
        let selectReg;


        if (townsid > 0) {
            selectReg = await pool.query('select reg_number from regNumbers where reg_number=$1', [enteredReg])
        }

        if (selectReg.rowCount === 0) {
            await pool.query('insert into regNumbers (reg_number,town_id) values ($1,$2)', [enteredReg, townsid])

        }
    }

    async function getReg() {
        const get = await pool.query('select reg_number from regNumbers')
        return get.rows;
    }
    async function clearRegNo() {
        await pool.query('delete from regNumbers')
    }

    async function filteringTown(id) {
        if (id === 'All') {
            return getReg();

        } else {
            const selectTown = await pool.query('select reg_number from regNumbers where town_id=$1', [id]);
            return selectTown.rows;
        }

    }
    async function check(enteredReg) {
        let checkDuplicate = await pool.query('select reg_number from regNumbers where reg_number=$1', [enteredReg])
        return checkDuplicate.rowCount;
    }
    return {
        getReg,
        setReg,
        clearRegNo,
        filteringTown,
        check
    }

}