CREATE TABLE TsunamiShelters (
    id INT PRIMARY KEY,
    sido_name VARCHAR(100),
    sigungu_name VARCHAR(100),
    remarks VARCHAR(255),
    shel_nm VARCHAR(255),
    address VARCHAR(255),
    lat DECIMAL(10, 7),
    lon DECIMAL(10, 7),
    shel_av INT,
    lenth INT,
    shel_div_type VARCHAR(255),
    seismic VARCHAR(255),
    height DECIMAL(10, 2),
    tel VARCHAR(100),
    new_address VARCHAR(255),
    manage_gov_nm VARCHAR(255)
);
