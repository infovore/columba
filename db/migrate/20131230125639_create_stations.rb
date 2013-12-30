class CreateStations < ActiveRecord::Migration
  def change
    create_table :stations do |t|
      t.integer :original_id
      t.string :name
      t.string :terminal_name
      t.point :latlon, :geographic => true
      t.boolean :is_installed
      t.boolean :is_locked
      t.integer :install_date
      t.integer :removal_date, :default => nil
      t.boolean :is_temporary
      t.integer :number_bikes
      t.integer :number_docks
      t.integer :number_empty_docks
      t.timestamps
    end
  end
end
