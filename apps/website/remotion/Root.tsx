import { Composition } from "remotion";
import { GradientBackground } from "./compositions/GradientBackground";

/**
 * Remotion root component with all video compositions.
 */
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="GradientBackground"
        component={GradientBackground}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
