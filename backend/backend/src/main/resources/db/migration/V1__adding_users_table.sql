create table users
(
    user_id      int auto_increment
        primary key,
    name         varchar(50)  not null,
    email        varchar(100) not null unique,
    password     varchar(255) null,
    phone_number varchar(20)  not null UNIQUE,
    created_at   timestamp     default CURRENT_TIMESTAMP,
    updated_at   timestamp     default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP
);

