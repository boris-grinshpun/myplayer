import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import Playlist from "../components/playlist/Playlist";

test("displays a playlist", async () => {
    const playlist = render(
        <Playlist list={[{songId: "qweasdqweqw", id: 1}, {songId: "asdasdasdasd", id: 2}]}/>
    );
  
    const playlistElement = await playlist.findByTestId("playlist");
    expect(playlistElement.children.length).toEqual(2)
    playlist.unmount();
  });
