import type { ProgramSection } from '@/lib/types';
import { Check, X } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ProgramsTableProps {
  section: ProgramSection;
}

export default function ProgramsTable({ section }: ProgramsTableProps) {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-headline text-2xl font-semibold">{section.title}</h3>
        <p className="mt-1 text-muted-foreground">{section.description}</p>
      </div>
      
      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 font-headline">Feature</TableHead>
                <TableHead className="text-center font-headline">Clarity</TableHead>
                <TableHead className="text-center font-headline">Performance</TableHead>
                <TableHead className="text-center font-headline">Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.features.map((item) => (
                <TableRow key={item.feature}>
                  <TableCell className="font-medium flex items-center">
                    {item.feature}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.clarity === 'boolean' ? (
                      item.clarity ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.clarity
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.performance === 'boolean' ? (
                      item.performance ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.performance
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.enterprise === 'boolean' ? (
                      item.enterprise ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.enterprise
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {['Clarity', 'Performance', 'Enterprise'].map((program) => (
          <Card key={program}>
            <CardHeader>
              <CardTitle className="font-headline">{program}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {section.features.map((item) => {
                  const programKey = program.toLowerCase() as 'clarity' | 'performance' | 'enterprise';
                  const value = item[programKey];
                  return (
                    <li key={item.feature} className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        {item.feature}
                      </span>
                       <span className="text-right font-medium">
                        {typeof value === 'boolean' ? (
                            value ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-destructive" />
                        ) : (
                          value
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
