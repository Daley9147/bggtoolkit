import type { ProgramSection } from '@/lib/types';
import { Check, X, Info } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ProgramsTableProps {
  section: ProgramSection;
}

const SessionInfoPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2 h-5 w-5 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="sr-only">Session Information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-headline font-medium leading-none">Session Details</h4>
            <p className="text-sm text-muted-foreground">
              Additional information about the mentoring sessions.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Length</span>
              <span className="col-span-2">45–60 minutes</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Format</span>
              <span className="col-span-2">Mentee-led, mentor-guided</span>
            </div>
            <div>
                <h5 className="font-semibold mt-2 mb-1">Purpose:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Provide a structured, safe space for open discussion.</li>
                    <li>Review current progress and celebrate wins.</li>
                    <li>Explore challenges in business and life.</li>
                    <li>Conduct an action check on previous commitments.</li>
                    <li>Identify next steps to maintain momentum.</li>
                </ul>
            </div>
             <div>
                <h5 className="font-semibold mt-2 mb-1">Benefits:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Keeps the mentee accountable.</li>
                    <li>Builds confidence in decision-making.</li>
                    <li>Provides clarity on priorities.</li>
                    <li>Ensures consistent progress toward goals.</li>
                </ul>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
);

const CrisisCallInfoPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2 h-5 w-5 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="sr-only">Crisis Call Information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-headline font-medium leading-none">Crisis Call Details</h4>
            <p className="text-sm text-muted-foreground">
              Rapid support for time-sensitive issues.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Length</span>
              <span className="col-span-2">15 minutes</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Availability</span>
              <span className="col-span-2">Bookable within 2 hours</span>
            </div>
            <div>
                <h5 className="font-semibold mt-2 mb-1">Purpose:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Provide rapid support for time-sensitive issues.</li>
                    <li>Navigate urgent problems or challenges.</li>
                </ul>
            </div>
            <div>
                <h5 className="font-semibold mt-2 mb-1">Common Examples:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Disciplinary action for an employee</li>
                    <li>Conflict resolution within the team</li>
                    <li>Unexpected client or supplier issues</li>
                    <li>Financial or operational emergencies</li>
                </ul>
            </div>
             <div>
                <h5 className="font-semibold mt-2 mb-1">Benefits:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Ensures you are never "stuck" without guidance.</li>
                    <li>Helps prevent small problems from escalating.</li>
                    <li>Provides reassurance and stability.</li>
                </ul>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
);

const StrategyActionReviewInfoPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2 h-5 w-5 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="sr-only">Strategy & Action Review Information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-headline font-medium leading-none">Strategy & Action Review Details</h4>
            <p className="text-sm text-muted-foreground">
              A mentor-led deep-dive session.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Length</span>
              <span className="col-span-2">60–90 minutes</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Format</span>
              <span className="col-span-2">Mentor-led deep-dive</span>
            </div>
            <div>
                <h5 className="font-semibold mt-2 mb-1">Purpose:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Review overall business strategy.</li>
                    <li>Assess progress against long-term goals.</li>
                    <li>Identify gaps, risks, or new opportunities.</li>
                    <li>Refine or reset the action plan.</li>
                    <li>Ensure alignment with AEROPS framework.</li>
                </ul>
            </div>
            <div>
                <h5 className="font-semibold mt-2 mb-1">Key Activities:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Review performance metrics and results.</li>
                    <li>Evaluate effectiveness of previous actions.</li>
                    <li>Re-align business priorities with goals.</li>
                    <li>Agree clear action steps for the next phase.</li>
                </ul>
            </div>
             <div>
                <h5 className="font-semibold mt-2 mb-1">Benefits:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Provides structured accountability.</li>
                    <li>Maintains strategic focus.</li>
                    <li>Ensures progress toward sustainable growth.</li>
                    <li>Builds clarity and confidence.</li>
                </ul>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
);

const PowerReviewInfoPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2 h-5 w-5 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="sr-only">Power Review Information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-headline font-medium leading-none">Power Review Details</h4>
            <p className="text-sm text-muted-foreground">
              A comprehensive mentor-led review session.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Length</span>
              <span className="col-span-2">2–2.5 hours</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-semibold">Frequency</span>
              <span className="col-span-2">Twice (6 & 12 months)</span>
            </div>
            <div>
                <h5 className="font-semibold mt-2 mb-1">Purpose:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Conduct a full review of business and program progress.</li>
                    <li>Revisit goals to assess overall performance.</li>
                    <li>Apply course corrections if needed.</li>
                    <li>Amplify successful strategies.</li>
                    <li>Ensure mentee is positioned for strong growth.</li>
                </ul>
            </div>
            <div>
                <h5 className="font-semibold mt-2 mb-1">Key Activities:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Review all areas of the AEROPS framework.</li>
                    <li>Assess ROI and set targets for the next stage.</li>
                    <li>Recalibrate goals, KPIs, and action plans.</li>
                    <li>Address unresolved or emerging challenges.</li>
                    <li>Capture success stories and lessons learned.</li>
                </ul>
            </div>
             <div>
                <h5 className="font-semibold mt-2 mb-1">Benefits:</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Provides a milestone to measure business transformation.</li>
                    <li>Keeps focus on long-term objectives.</li>
                    <li>Ensures program remains personalised and effective.</li>
                    <li>Creates a renewed sense of direction and energy.</li>
                </ul>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
);


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
                <TableHead className="text-center font-headline">Elevate</TableHead>
                <TableHead className="text-center font-headline">Intensive</TableHead>
                <TableHead className="text-center font-headline">Boardroom</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.features.map((item) => (
                <TableRow key={item.feature}>
                  <TableCell className="font-medium flex items-center">
                    {item.feature}
                    {item.feature === '1-to-1 Sessions (per year)' && <SessionInfoPopover />}
                    {item.feature === 'Crisis Calls (15 min)' && <CrisisCallInfoPopover />}
                    {item.feature === 'Strategy & Action Reviews' && <StrategyActionReviewInfoPopover />}
                    {item.feature === 'Power Review' && <PowerReviewInfoPopover />}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.elevate === 'boolean' ? (
                      item.elevate ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.elevate
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.intensive === 'boolean' ? (
                      item.intensive ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.intensive
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof item.boardroom === 'boolean' ? (
                      item.boardroom ? <Check className="mx-auto h-5 w-5 text-green-600" /> : <X className="mx-auto h-5 w-5 text-destructive" />
                    ) : (
                      item.boardroom
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
        {['Elevate', 'Intensive', 'Boardroom'].map((program) => (
          <Card key={program}>
            <CardHeader>
              <CardTitle className="font-headline">{program}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {section.features.map((item) => {
                  const programKey = program.toLowerCase() as 'elevate' | 'intensive' | 'boardroom';
                  const value = item[programKey];
                  return (
                    <li key={item.feature} className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        {item.feature}
                        {item.feature === '1-to-1 Sessions (per year)' && <SessionInfoPopover />}
                        {item.feature === 'Crisis Calls (15 min)' && <CrisisCallInfoPopover />}
                        {item.feature === 'Strategy & Action Reviews' && <StrategyActionReviewInfoPopover />}
                        {item.feature === 'Power Review' && <PowerReviewInfoPopover />}
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
