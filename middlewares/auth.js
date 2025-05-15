
export const authUser = (req, res, next) => {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userName,
      addresses
    } = req.body;

    // Check for missing fields
    if (!firstName || !lastName || !email ||  !password ||  !phoneNumber ||  !userName || !addresses) {
      return res.status(400).json({ error: true, message: "All fields are required." });
    }

    // Validate addresses
    if (!Array.isArray(addresses),  addresses.length === 0) {
      return res.status(400).json({ error: true, message: "At least one address is required." });
    }

    // Validate each address
    for (const address of addresses) {
      const { address: addr, subDistrict, district, city, postal } = address;
      if (!addr || !subDistrict || !district || !city || !postal) {
        return res.status(400).json({ error: true, message: "Each address must include address, subDistrict, district, city, and postal." });
      }
    }

    next();

    
  };