import Button from "@/components/Atoms/Button/Button";
import style from "./Header.module.scss";

interface HeaderProps {
  title: string;
}

const Header = (props: HeaderProps) => {
  const { title } = props;

  return (
    <div className={style.main}>
      <h1>{title}</h1>
    </div>
  );
};

export default Header;