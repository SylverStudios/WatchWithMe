defmodule StoreTest do
  use ExUnit.Case

  test "caches and finds the correct data" do
    assert Store.Cache.fetch(1, fn ->
      %{id: 1, long_url: "http://www.example.com"}
    end) == %{id: 1, long_url: "http://www.example.com"}

    assert Store.Cache.fetch(1, fn -> "" end) == %{id: 1, long_url: "http://www.example.com"}
  end
end
