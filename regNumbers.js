module.exports = function regFactoryFunction(pool) {

    async function setReg(enteredReg) {
        let select = await pool.query('select reg_number from regNumbers where reg_number=$1', [enteredReg])
        if (select.rowCount === 0) {
            await pool.query('insert into regNumbers (reg_number) values ($1)', [enteredReg])
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
            let all = await pool.query('select reg_number from regNumbers')
            return all.rows
        } else {
            const selectTown = ('select reg_number from regNumbers where  town_id= ($1)', [id]);
            return selectTown.rows;
        }

    }
    return {
        getReg,
        setReg,
        clearRegNo,
        filteringTown
    }

}