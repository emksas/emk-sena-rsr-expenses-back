class Expense {
    constructor(
        id,
        amount,
        description, 
        state, 
        date,
        idPlanification,
        accountId
    ) {
        this.id = id;
        this.amount = amount;
        this.description = description;
        this.state = state;
        this.date = date;
        this.idPlanification = idPlanification;
        this.accountId = accountId;
    }

    static fromDatabaseRow(row) {
        return new Expense(
            row.idegreso,
            row.valor,
            row.descripcion,
            row.estado,
            row.fecha, 
            row.idPlanificacion,
            row.cuentaContable_id
        );
    }

    toDatabaseRow() {
        return {
            idegreso: this.id,
            valor: this.amount,
            descripcion: this.description,
            estado: this.state,
            fecha: this.date,
            idPlanificacion: this.idPlanification,
            cuentaContable_id: this.accountId
        };
    }
}

module.exports = Expense;