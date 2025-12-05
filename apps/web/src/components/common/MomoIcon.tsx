import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const MomoSvg = () => (
  <svg
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="4607"
    width="1em"
    height="1em"
    fill="currentColor"
  >
    <path
      d="M517.866667 32.106667a10.666667 10.666667 0 0 0-15.061334 0L32.106667 502.826667a10.666667 10.666667 0 0 0-0.021334 15.061333l470.677334 474.005333a10.666667 10.666667 0 0 0 15.104 0.042667l474.026666-472.362667a10.666667 10.666667 0 0 0 0-15.104L517.866667 32.106667z m-38.506667 150.186666a10.666667 10.666667 0 0 1 18.197333 7.573334v640.981333a10.666667 10.666667 0 0 1-18.197333 7.552L156.373333 517.930667a10.666667 10.666667 0 0 1 0-15.146667L479.36 182.293333z"
      p-id="4608"
    />
  </svg>
);

export const MomoIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={MomoSvg} {...props} />
);
