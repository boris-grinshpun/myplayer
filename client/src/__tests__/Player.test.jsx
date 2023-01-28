import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import Player from "../components/player/Player";

test("displays a default thumbnail when id is missing", async () => {
    const player = render(
        <Player songId={null}/>
    );
  
    const playerThumbnail = await player.findByTestId("thumbnail");
    expect(playerThumbnail.innerHTML).toContain("Enter YouTube Song ID");
    player.unmount();
  });
test("displays a player when ID is passed", async () => {
    const player = render(
        <Player songId={"PvF9PAxe5Ng"}/>
    );
  
    const playerThumbnail = await player.findByTestId("video-player");
    expect(playerThumbnail).toBeDefined()
    player.unmount();
  });