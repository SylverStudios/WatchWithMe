defmodule Cache.CacheTest do
  use ExUnit.Case, async: true
  alias Fjord.Cache

  test "fetch will set default value if not found" do
    default = default_value();

    value_at_1 = Cache.fetch(1, default)

    assert default == value_at_1
  end

  test "fetch will return value stored" do
    custom = custom_value(true, 120)

    Cache.set(5, custom)

    assert custom == Cache.fetch(5, default_value())
  end

# Private
  defp default_value() do
    %{atom_key: true, "string_key": 100}
  end

  defp custom_value(atom_key_value, string_key_value) do
    %{atom_key: atom_key_value, "string_key": string_key_value}
  end
end
