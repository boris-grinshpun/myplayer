export default class GlobalStore {
    constructor() {
        this.users = []
        this.cachedPlaylist = []
        this.intervalId = null

    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new GlobalStore();
        }

        return this.instance;
    }
}