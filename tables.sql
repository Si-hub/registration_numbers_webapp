create table towns(
    id serial primary key,
    town_name text not null,
    start_string text not null
);

create table regNumbers(
    id serial primary key,
    reg_number text not null,
    town_id int,
    FOREIGN KEY (town_id) REFERENCES towns(id)
);

insert into towns (town_name ,start_string ) VALUES ('Bellville', 'CY');
insert into towns (town_name ,start_string ) VALUES ('Cape Town', 'CA');
insert into towns (town_name ,start_string ) VALUES ('Stellenbosch', 'CL');