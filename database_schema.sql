-- database_schema.sql
CREATE TABLE IF NOT EXISTS battery_data (
  id SERIAL PRIMARY KEY,
  battery_id VARCHAR(50) NOT NULL,
  current DECIMAL(10,2),
  voltage DECIMAL(10,2),
  temperature DECIMAL(10,2),
  time TIMESTAMP NOT NULL,
  CONSTRAINT uq_battery_time UNIQUE (battery_id, time)
);

CREATE INDEX IF NOT EXISTS idx_battery_id ON battery_data(battery_id);
CREATE INDEX IF NOT EXISTS idx_battery_time ON battery_data(time);