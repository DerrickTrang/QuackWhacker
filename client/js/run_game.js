async function startGame() {
    await loadAssets();
    await initMenu();
    await initGame();
    requestAnimationFrame(gameLoop);
}

startGame();