import AppInitializer from "@/components/app-initializer"

const DashbooardLayout = ({children}:{children:Readonly<React.ReactNode>}) => {
  return (    
    <AppInitializer>
        {children}
    </AppInitializer>
  )
}

export default DashbooardLayout