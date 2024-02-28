
type Props = {
  children: React.ReactNode;
};

export default function AccountLayout(props: Props) {
  return (
    <div>
      {props.children}
    </div>
  );
};
