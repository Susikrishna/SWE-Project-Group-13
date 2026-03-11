const Role = require("../models/Role");

const createRole = async (req,res) => {
    try{
        const {name,frontends, services, isTemp, startDate, endDate} = req.body
        console.log(name)
        const prev = await Role.findOne({ name: name.trim().toLowerCase() })
        console.log("prev:",prev)
        if (prev!=null){
            return res.status(400).json({ error: `Role "${name}" already exists` });
        }
        const role = await Role.create({
            name: name.trim().toLowerCase(),
            microfrontends: frontends || [],
            microservices: services || [],
            isTemp:isTemp,
            startDate:startDate,
            endDate:endDate,
        });
        res.status(201).json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = {createRole}

