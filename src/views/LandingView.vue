<template>
    
    <div style="width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: start;" id="tsparticles">

        <!-- BEGIN Nav Bar -->
        <div class="env-bar" style="border: 0; padding: 20px 30px;">
            <!-- BEGIN Logo -->
            <div style="display: flex;">
                <img src="../assets/images/cloudcontain.svg" width="175" class="my-auto" />
                <p class="my-auto ms-2" style="font-size: 17px;">by <strong>Theo Nakfoor</strong></p>
            </div>
            <!-- END Logo -->
            <button class="env-action my-auto" @click="startBuilding()">Start Building <v-icon icon="mdi-chevron-double-right" class="my-auto ms-1"></v-icon></button>
        </div>
        <!-- END Nav Bar -->

        <div style="width: 100vw; flex: 1; display: flex; align-items: center; padding: 0px 35px; font-family: 'DM Sans';">
            <div>
                <h1>On-demand dev environments that follow<br>you &mdash; not your hardware</h1>
                <h3 style="font-weight: 300;">Build, run and share from anywhere in the world</h3>
            </div>

            <div style="width: 450px; height: 450px; background: rgba(55, 154, 245, 0.5); position: absolute; bottom: 0; right: 5%; z-index: -1;">
            <div style="width: 400px; height: 400px; background: rgba(55, 154, 245, 0.7); position: absolute; bottom: 0; right: 60%; z-index: -2; border-radius: 1000px;"></div>
            <div style="width: 0; height: 0; position: absolute; bottom: 0; right: 120%; z-index: -3; border-left: 450px solid transparent; border-right: 150px solid transparent; border-bottom: 450px solid rgba(55, 154, 245, 0.75);"></div>


            </div>
        </div>

    </div>


</template>

<script>
export default {
    data() {
        return {
            loading: false,
        }
    },
    async mounted() {
        setTimeout(() => {
            window.tsParticles.load("tsparticles", {
            particles: {
                number: { value: 80 },
                color: { value: "#ffffff" },
                shape: { type: "triangle" },
                opacity: { value: 0.5 },
                size: { value: 3 },
                move: { enable: true, speed: 2 }
            }
        });
        }, 1000);
    },
    methods: {
        startBuilding() {
            window.open(`/drive`, "_self");
        }
    }
}
</script>