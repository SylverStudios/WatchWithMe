defmodule Wwm.Repo.Migrations.AddTestTable do
  use Ecto.Migration

  def change do
    create table(:test) do
      add :raw, :string

      timestamps()
    end
  end
end
