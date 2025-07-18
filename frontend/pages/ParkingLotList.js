import PLotCard from "../components/PLotCard.js";

export default {
    template: `
        <div class="p-4">
            <h1> Parking Lot List </h1>
            <h2> {{ parkingLots.length }} Parking Lots Available </h2>
            <PLotCard
                v-for="parkingLot in parkingLots"
                :key="parkingLot.plot_id"
                :parking-lot="parkingLot"
            />
        </div>
        `,
    data() {
        return {
            parkingLots: [],
        };
    },
    methods: {
        
    },
    async mounted(){
        const res = await fetch(location.origin + '/api/parking_lots', {
            headers : {
                'Authentication-Token' : this.$store.state.auth_token
            }
        })

        this.parkingLots = await res.json()
    },
    components : {
        PLotCard,
    }
}          