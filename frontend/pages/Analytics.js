export default {
    template: `
        <div class="container my-4">
            <h1 class="display-4 text-center mb-3">Admin Summary Dashboard</h1>
            <p class="lead text-center text-muted mb-4">Monthly overview of parking activity.</p>

            <div v-if="isLoading" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading analytics data...</p>
            </div>

            <div v-else-if="errorMessage" class="alert alert-danger text-center" role="alert">
                {{ errorMessage }}
            </div>

            <div v-else class="row justify-content-center">
                <!-- Total Revenue Chart -->
                <div class="col-12 col-lg-6 mb-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0">Total Revenue (Monthly)</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="revenueChart" height="300"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Total Hours Parked Chart -->
                <div class="col-12 col-lg-6 mb-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">Total Hours Parked (Monthly)</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="hoursParkedChart" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            analyticsData: [],
            isLoading: true,
            errorMessage: '',
            charts: {
                revenue: null,
                hoursParked: null
            }
        };
    },
    methods: {
        async fetchAnalyticsData() {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const res = await fetch(`${location.origin}/api/analytics`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    this.errorMessage = errorData.message || 'Failed to load analytics data.';
                    this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                    if (res.status === 401 || res.status === 403) {
                        this.$store.commit('logout');
                        this.$router.push('/login');
                    }
                    return;
                }

                this.analyticsData = await res.json();

                // Wait until canvas elements are rendered
                setTimeout(() => {
                    this.renderCharts();
                }, 100);

            } catch (error) {
                this.errorMessage = 'Network error. Could not load analytics data.';
                this.$store.commit('showToast', { message: this.errorMessage, type: 'danger' });
                console.error('Network error fetching analytics:', error);
            } finally {
                this.isLoading = false;
            }
        },

        renderCharts() {
            const labels = this.analyticsData.map(d => d.month);
            const revenueData = this.analyticsData.map(d => d.total_revenue);
            const hoursParkedData = this.analyticsData.map(d => d.total_hours_parked);

            if (this.charts.revenue) this.charts.revenue.destroy();
            if (this.charts.hoursParked) this.charts.hoursParked.destroy();

            const revenueCanvas = document.getElementById('revenueChart');
            if (revenueCanvas) {
                const revenueCtx = revenueCanvas.getContext('2d');
                this.charts.revenue = new Chart(revenueCtx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Total Revenue (₹)',
                            data: revenueData,
                            backgroundColor: 'rgba(40, 167, 69, 0.2)',
                            borderColor: 'rgba(40, 167, 69, 1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }

            const hoursCanvas = document.getElementById('hoursParkedChart');
            if (hoursCanvas) {
                const hoursCtx = hoursCanvas.getContext('2d');
                this.charts.hoursParked = new Chart(hoursCtx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Hours Parked',
                            data: hoursParkedData,
                            backgroundColor: 'rgba(0, 123, 255, 0.6)',
                            borderColor: 'rgba(0, 123, 255, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }
        }
    },
    async mounted() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.fetchAnalyticsData();
            document.head.appendChild(script);
        } else {
            this.fetchAnalyticsData();
        }
    },
    beforeDestroy() {
        if (this.charts.revenue) this.charts.revenue.destroy();
        if (this.charts.hoursParked) this.charts.hoursParked.destroy();
    }
};
