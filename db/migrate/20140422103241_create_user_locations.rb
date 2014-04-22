class CreateUserLocations < ActiveRecord::Migration
  def change
    create_table :user_locations do |t|
      t.string :name
      t.point :latlon, :geographic => true
      t.integer :heading
      t.timestamps
    end

    add_index :user_locations, :name
  end
end
