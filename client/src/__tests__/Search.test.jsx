import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import Search from "../components/search/Search";

test("displays a error on invalid ID", async () => {
    const search = render(
        <Search/>
    );
    const input =  await search.findByTestId("input");
    input.value = "PvF9PA"
    const button = await search.findByTestId("button");
    await button.click()
    const error = await search.findByTestId("error");
    expect(error).toBeDefined()
    search.unmount();
  });
  
test("reset serch field after search", async () => {
    const search = render(
        <Search onAddSong={()=>null}/>
    );
    const input =  await search.findByTestId("input");
    input.value = "PvF9PAxe5Ng"
    const button = await search.findByTestId("button");
    await button.click()
    expect(input.value).toBe("")
    search.unmount();
  });
